import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  action: string
  subscription_id?: string
  user_id?: string
  payment_method_id?: string
  type?: string
  plan_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: RequestBody = await req.json()
    const { action } = body

    console.log(`Processing action: ${action} for user: ${user.id}`)

    switch (action) {
      case 'cancel_subscription': {
        const { subscription_id } = body
        if (!subscription_id) {
          return new Response(
            JSON.stringify({ error: 'subscription_id é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get subscription to verify ownership
        const { data: subscription, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .select('*, customers!inner(*)')
          .eq('id', subscription_id)
          .single()

        if (subError || !subscription) {
          return new Response(
            JSON.stringify({ error: 'Assinatura não encontrada' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verify the subscription belongs to the user
        if (subscription.customers.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Não autorizado' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // TODO: Integrate with payment gateway (Stripe, etc.) to cancel
        // For now, just update the status in our database
        
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            cancel_at: subscription.current_period_end // Cancel at end of period
          })
          .eq('id', subscription_id)

        if (updateError) {
          console.error('Error canceling subscription:', updateError)
          return new Response(
            JSON.stringify({ error: 'Erro ao cancelar assinatura' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Assinatura cancelada' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete_account': {
        // Verify the user is deleting their own account
        if (body.user_id && body.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Não autorizado' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get customer
        const { data: customer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (customer) {
          // TODO: Cancel any active subscriptions with payment gateway
          
          // Delete customer (cascades to payment_methods, subscriptions, payments)
          await supabaseAdmin
            .from('customers')
            .delete()
            .eq('id', customer.id)
        }

        // Delete user data - vendas_individuais, dados_diarios will cascade from vendedores
        await supabaseAdmin.from('vendedores').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabaseAdmin.from('metas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabaseAdmin.from('squads').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        // Delete user from auth
        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (deleteUserError) {
          console.error('Error deleting user:', deleteUserError)
          return new Response(
            JSON.stringify({ error: 'Erro ao excluir conta' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Conta excluída' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'add_payment_method': {
        const { type } = body
        
        // Get or create customer
        let { data: customer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!customer) {
          const { data: newCustomer, error: createError } = await supabaseAdmin
            .from('customers')
            .insert({
              user_id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || null
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating customer:', createError)
            return new Response(
              JSON.stringify({ error: 'Erro ao criar cliente' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          customer = newCustomer
        }

        // TODO: Create setup intent with payment gateway
        // This would return a client_secret for the frontend to complete the setup
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            customer_id: customer.id,
            message: 'Preparado para adicionar método de pagamento',
            // client_secret: 'stripe_setup_intent_client_secret' // From Stripe
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'remove_payment_method': {
        const { payment_method_id } = body
        if (!payment_method_id) {
          return new Response(
            JSON.stringify({ error: 'payment_method_id é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get payment method to verify ownership
        const { data: paymentMethod, error: pmError } = await supabaseAdmin
          .from('payment_methods')
          .select('*, customers!inner(*)')
          .eq('id', payment_method_id)
          .single()

        if (pmError || !paymentMethod) {
          return new Response(
            JSON.stringify({ error: 'Método de pagamento não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (paymentMethod.customers.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Não autorizado' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // TODO: Detach from payment gateway

        const { error: deleteError } = await supabaseAdmin
          .from('payment_methods')
          .delete()
          .eq('id', payment_method_id)

        if (deleteError) {
          console.error('Error removing payment method:', deleteError)
          return new Response(
            JSON.stringify({ error: 'Erro ao remover método de pagamento' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Método de pagamento removido' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'set_default_payment_method': {
        const { payment_method_id } = body
        if (!payment_method_id) {
          return new Response(
            JSON.stringify({ error: 'payment_method_id é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get payment method to verify ownership
        const { data: paymentMethod, error: pmError } = await supabaseAdmin
          .from('payment_methods')
          .select('*, customers!inner(*)')
          .eq('id', payment_method_id)
          .single()

        if (pmError || !paymentMethod) {
          return new Response(
            JSON.stringify({ error: 'Método de pagamento não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (paymentMethod.customers.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Não autorizado' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Remove default from all other payment methods for this customer
        await supabaseAdmin
          .from('payment_methods')
          .update({ is_default: false })
          .eq('customer_id', paymentMethod.customer_id)

        // Set this one as default
        const { error: updateError } = await supabaseAdmin
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', payment_method_id)

        if (updateError) {
          console.error('Error setting default:', updateError)
          return new Response(
            JSON.stringify({ error: 'Erro ao atualizar método padrão' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Método padrão atualizado' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create_subscription': {
        const { plan_id, payment_method_id } = body
        
        if (!plan_id) {
          return new Response(
            JSON.stringify({ error: 'plan_id é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get or create customer
        let { data: customer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!customer) {
          const { data: newCustomer, error: createError } = await supabaseAdmin
            .from('customers')
            .insert({
              user_id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || null
            })
            .select()
            .single()

          if (createError) {
            return new Response(
              JSON.stringify({ error: 'Erro ao criar cliente' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          customer = newCustomer
        }

        // Get plan
        const { data: plan, error: planError } = await supabaseAdmin
          .from('plans')
          .select('*')
          .eq('id', plan_id)
          .single()

        if (planError || !plan) {
          return new Response(
            JSON.stringify({ error: 'Plano não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // TODO: Create subscription with payment gateway
        // For now, create a local subscription record

        const now = new Date()
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + plan.interval_count)

        const { data: subscription, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            customer_id: customer.id,
            plan_id: plan.id,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString()
          })
          .select()
          .single()

        if (subError) {
          console.error('Error creating subscription:', subError)
          return new Response(
            JSON.stringify({ error: 'Erro ao criar assinatura' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, subscription }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in payment-gateway:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
