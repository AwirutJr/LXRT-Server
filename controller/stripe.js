const prisma = require('../config/prisma')

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.payment = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: Number(req.user.id),
      },
    });

    const amountTHB = Number(cart.cartTotal) * 100

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
            clientSecret: paymentIntent.client_secret,
          });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}