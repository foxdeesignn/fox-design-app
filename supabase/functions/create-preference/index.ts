import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { product_id, user_email } = await req.json()
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

    if (!MP_ACCESS_TOKEN) {
      throw new Error('Chave do Mercado Pago não configurada no Supabase.')
    }

    // Tabela de Preços Fox Store
    const products: Record<string, any> = {
      'subgoal_gta_vi': { title: 'Meta de Subs: GTA VI Edition', price: 59.90 },
      'subgoal_fortnite': { title: 'Meta de Subs: Fortnite Edition', price: 59.90 },
      'subgoal_arc_riders': { title: 'Meta de Subs: Arc Riders Vision', price: 59.90 },
      'subgoal_grenade': { title: 'Meta de Subs: Grenade Edition', price: 59.90 },
      'pacote_iniciante': { title: 'Pacote Iniciante Fox', price: 197.00 },
      'pacote_god': { title: 'Pacote GOD Fox', price: 497.00 },
      'pacote_premium': { title: 'Pacote Premium Fox', price: 897.00 },
      'pacote_ultimate': { title: 'Pacote Ultimate Fox', price: 1497.00 },
    }

    const product = products[product_id]
    if (!product) throw new Error(`Produto ${product_id} não encontrado na tabela de preços.`)

    // Criar preferência no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: product.title,
            unit_price: product.price,
            quantity: 1,
            currency_id: 'BRL',
          }
        ],
        back_urls: {
          success: 'https://foxdeesignn.github.io/fox-design-app/',
          failure: 'https://foxdeesignn.github.io/fox-design-app/loja.html',
          pending: 'https://foxdeesignn.github.io/fox-design-app/'
        },
        auto_return: 'approved',
        external_reference: product_id
      }),
    })

    const data = await response.json()
    console.log("MP Response:", data)

    if (!data.init_point) {
      throw new Error(data.message || 'Erro ao gerar link no Mercado Pago.')
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
