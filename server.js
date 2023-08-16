require('dotenv').config()

const express = require('express')

const app = express()

app.use(express.json())
app.use(express.static('public'))

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([
    [1 , {priceInCents: "10000" , name: "jack"}],
    [2 , {priceInCents: "20000" , name: "jenil"}],
])

app.post("/v1/checkout/sessions" , async (req , res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items:req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data:{
                        currency:'inr',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                }
            }),
            success_url:`${process.env.SERVER_URL}/success.html`,
            cancel_url:`${process.env.SERVER_URL}/cancel.html`
        })
        res.json({url: session.url})
    } catch (error) {
        res.status(500).json({error: error.massage})
    }
})

app.listen(3000 , () => {
    console.log("success");
})

