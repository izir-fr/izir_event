var Product = require('../models/product')
var Cart = require('../models/cart')
var Event = require('../models/event')
var Race = require('../models/race')
var Registration = require('../models/registration')
var Notification = require('../models/notification')
var Promise = require('bluebird')

// Credentials
var credentials = require('../../config/credentials')

// STRIPE
var stripe = require('stripe')(credentials.stripeKey.serveur)

var dateNow = new Date(Date.now())

var raceData = (query) => {
  return new Promise((resolve, reject) => {
    Race
      .findById(query.ref)
      .populate('event')
      .exec((err, race) => {
        if (err) {
          reject(err)
        }
        var res = {
          ref: query.ref,
          qty: query.qty,
          description: race.description,
          event: race.event,
          name: race.name,
          price: race.tarif,
          team: race.team,
          race: true,
          paiement_cb_required: race.event.paiement_cb_required,
          subtotal: query.qty * race.tarif
        }
        resolve(res)
      })
  })
}

var optionData = (query) => {
  return new Promise((resolve, reject) => {
    Event
      .findOne({ 'options._id': query.ref })
      .exec((err, event) => {
        if (err) {
          reject(err)
        }
        if (event) {
          if (event.options.length >= 1) {
            event.options.forEach((option) => {
              if (String(option._id) === String(query.ref)) {
                var res = {
                  ref: query.ref,
                  qty: query.qty,
                  event: event._id,
                  name: option.reference,
                  price: option.prix,
                  option: true,
                  paiement_cb_required: event.paiement_cb_required,
                  subtotal: query.qty * option.prix
                }
                resolve(res)
              }
            })
          } else {
            resolve(null)
          }
        } else {
          resolve(null)
        }
      })
  })
}

var cartCalc = (products) => {
  var total = 0
  if (products.length >= 1) {
    products.forEach((product) => {
      if (product !== null && product !== undefined) {
        total += product.price * product.qty
      }
    })
  }
  return total
}

var formatProducts = (products) => {
  var reachedProducts = []

  if (products.length >= 1) {
    products.forEach((product) => {
      if (product.ref !== '' && product.ref !== null && product.ref !== undefined) {
        if (product.race === true) {
          reachedProducts.push(raceData(product))
        }

        if (product.option === true) {
          reachedProducts.push(optionData(product))
        }
      }
    })
  }
  return reachedProducts
}

var checkIfProductIsAlreadyInTheCart = (products) => {
  var cleanedProducts = []
  if (products.length >= 1) {
    products.forEach((product) => {
      var exist = 0
      cleanedProducts.forEach((find, key) => {
        if (String(product.ref) === String(find.ref)) {
          exist++
          cleanedProducts[key].qty++
        }
      })
      if (exist === 0) {
        cleanedProducts.push(product)
      }
    })
  }
  return cleanedProducts
}

var cleanProducts = (products) => {
  var cleanedProducts = []

  if (products.length >= 1) {
    products.forEach((product) => {
      if (product !== null && product !== undefined) {
        cleanedProducts.push(product)
      }
    })
  }

  return checkIfProductIsAlreadyInTheCart(cleanedProducts)
}

var finalCart = (req) => {
  return new Promise((resolve, reject) => {
    var products
    var reachedProducts = []

    if (!req.session.cart) {
      resolve({ products: null })
    } else {
      products = cleanProducts(req.session.cart.products)
    }

    reachedProducts = formatProducts(products)

    Promise
      .all(reachedProducts)
      .then((products) => {
        var cleanedProducts = []
        if (products.length >= 1) {
          products.forEach((product) => {
            if (product !== null && product !== undefined) {
              cleanedProducts.push(product)
            }
          })
        }
        resolve({ products: cleanedProducts, totalPrice: cartCalc(cleanedProducts) })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

var formatTest = (format, data) => {
  if (format.name === 'race') {
    return {
      ref: data,
      race: true,
      qty: 1
    }
  } else if (format.name === 'option') {
    return {
      ref: data,
      option: true,
      qty: 1
    }
  }
}

var checkIfCreditRequired = (cart) => {
  var response = 0

  if (cart.products.length >= 1) {
    cart.products.forEach((product) => {
      if (product.paiement_cb_required === true) {
        response++
      }
    })
  }

  if (response >= 1) {
    return true
  } else {
    return false
  }
}

var getCart = (cartId) => {
  return new Promise((resolve, reject) => {
    Cart
      .findById(cartId)
      .exec((err, cart) => {
        if (err) {
          reject(err)
        } else {
          resolve(cart)
        }
      })
  })
}

var stripeProcess = (cart, stripeConfig) => {
  return new Promise((resolve, reject) => {
    stripe.charges.create(
      stripeConfig, (err, charge) => {
        if (err) {
          reject(err)
        } else {
          try {
            var paiement = {
              'amount': Number(charge.amount) / 100,
              'cb': charge.captured,
              'stripe_id': charge.id,
              'object': charge.object,
              'date': Date(charge.created),
              'captured': charge.captured
            }
          } catch (err) {
            reject(err)
          }

          if (charge.captured === true && charge.paid === true && charge.status === 'succeeded') {
            resolve(paiement)
          } else {
            reject(charge.captured, charge.paid)
          }
        }
      })
  })
}

var updateCartPaiement = (cartId, paiement) => {
  return new Promise((resolve, reject) => {
    // UPDATE registration.statut : 'payé' + paiementCaptured
    Cart
      .update({ _id: cartId }, { $set: { 'paiement': paiement } }, (err, cart) => {
        if (err) {
          reject(err)
        } else {
          resolve(cart)
        }
      })
  })
}

var createNotificationAndSendEmail = (notification, userId) => {
  notification
    .save((err, notification) => {
      if (err) throw err
      // EMAIL NOTIFICATION
      require('../../middleware/mailer')({user: userId})
    })
}

var createRegistration = (cart, paiement) => {
  return new Promise((resolve, reject) => {
    var races = []

    if (cart.products.length >= 1) {
      cart.products.forEach((product) => {
        if (product.race === true) {
          var qty = product.qty
          for (var i = 0; i < qty; i++) {
            races.push({
              cart: cart._id,
              event: product.event,
              ref: product.ref,
              team: product.team,
              user: cart.user
            })
          }
        }
      })
    }

    if (races.length >= 1) {
      races.forEach((race, key) => {
        var newRegistration = new Registration({
          user: race.user,
          event: race.event,
          cart: race.cart,
          produits: [ { race: race.ref } ],
          options: {
            epreuve_format: {
              team: race.team
            }
          },
          paiement: {
            captured: paiement.captured
          }
        })

        newRegistration
          .save((err, registration) => {
            if (err) {
              err({err: err})
            }
          })

        if ((key + 1) === races.length) {
          resolve({ done: true })
        }
      })
    } else {
      resolve({ done: true })
    }
  })
}

// set cart registration created ok
var setCartRegistrationOk = (cartId) => {
  return new Promise((resolve, reject) => {
    Cart
      .update({ _id: cartId }, { $set: { 'registrations_created': true } }, (err, cart) => {
        if (err) {
          resolve(err)
        } else {
          reject(cart)
        }
      })
  })
}

var cartCtrl = {
  // Get all product
  getCart: (req, res) => {
    var request = req
    finalCart(request)
      .then((cart) => {
        var config = {}
        var products = []

        config.paiement_cb_required = checkIfCreditRequired(cart)

        // ne conserver que les inscriptions ouvertes
        if (cart.products.length >= 1) {
          cart.products.forEach((product) => {
            if (product.race) {
              if (product.event.date_cloture_inscription >= dateNow) {
                products.push(product)
              }
            } else {
              products.push(product)
            }
          })
        }
        cart.products = products
        req.session.cart = { products: cart.products }
        res.render('partials/cart/panier', { checkout: cart, config: config })
      })
      .catch((err) => {
        if (err) {
          res.redirect('/')
        }
      })
  },
  postAddRegistration: (req, res) => {
    var productsCart = []
    var form = req.body

    if (req.session.cart) {
      productsCart = req.session.cart.products
    }

    // if session value set session cart as cart default value
    if (!req.user) {
      res.redirect('/user/login?event_id=' + req.query.event)
    } else {
      if (form.race !== undefined || form.option !== undefined) {
        if (form.race !== undefined) {
          if (form.race.constructor === Array) {
            form.race.forEach((val) => {
              productsCart.push(formatTest({ name: 'race' }, val))
            })
          } else {
            productsCart.push({
              ref: form.race,
              race: true,
              qty: 1
            })
          }
        }

        if (form.option !== undefined) {
          if (form.option.constructor === Array) {
            form.option.forEach((val) => {
              productsCart.push(formatTest({ name: 'option' }, val))
            })
          } else {
            productsCart.push({
              ref: form.option,
              option: true,
              qty: 1
            })
          }
        }

        req.session.cart = { products: productsCart }

        res.redirect('/cart')
      } else {
        req.flash('error_msg', 'Vous n\'avez sélectionné aucune épreuve et/ou option. Merci de cocher la case à gauche de l\'épreuve/option à laquelle vous souhaitez vous inscrire.')
        res.redirect(req.headers.referer)
      }
    }
  },
  // Get reduce product cart quantity by one
  getAddToCart: (req, res) => {
    var productId = req.params.product
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}})

    Product
      .findById(productId, (err, product) => {
        if (err) {
          res.redirect('/')
        }
        cart.add(product, product.product)
        req.session.cart = cart
        res.redirect('/catalogue/')
      })
  },
  // Change products quantity
  postChangeQty: (req, res) => {
    var productsCart = []
    if (req.session.cart) {
      if (req.session.cart.products) {
        productsCart = cleanProducts(req.session.cart.products)
      }
    }

    if (productsCart.length >= 1) {
      productsCart.forEach((product, key) => {
        if (String(product.ref) === String(req.params.product)) {
          if (Number(req.body.quantity) === 0) {
            delete productsCart[key]
          } else {
            productsCart[key].qty = req.body.quantity
          }
        }
      })
    }

    req.session.cart = { products: cleanProducts(productsCart) }
    res.redirect('/cart/')
  },
  // Remove a product
  getRemoveProductCart: (req, res) => {
    var productsCart = []
    if (req.session.cart) {
      if (req.session.cart.products) {
        productsCart = cleanProducts(req.session.cart.products)
      }
    }

    if (productsCart.length >= 1) {
      productsCart.forEach((product, key) => {
        if (String(product.ref) === String(req.params.product)) {
          delete productsCart[key]
        }
      })
    }

    req.session.cart = { products: cleanProducts(productsCart) }
    res.redirect('/cart/')
  },
  // Get add to cart a product
  getAllProduct: (req, res) => {
    res.redirect('https://shop.izir.fr')
  },
  // Get cart
  getProductById: (req, res) => {
    res.redirect('https://shop.izir.fr')
  },
  getPaiementCredit: (req, res) => {
    var request = req
    finalCart(request)
      .then((checkout) => {
        var config = {}

        var newCart = new Cart({
          user: req.user.id,
          products: checkout.products,
          total_price: Number(checkout.totalPrice)
        })

        var comission = 0

        if (checkout.products.length >= 1) {
          checkout.products.forEach((product) => {
            if (product.race === true) {
              comission += (product.qty) * 50
            }
          })
        }

        newCart.save((err, cart) => {
          if (err) {
            res.redirect('/cart')
          }
          config.stripe = {
            amount: parseInt(cart.total_price * 100 + comission),
            key: credentials.stripeKey.front,
            cart_id: cart._id,
            checkout_amout: cart.total_price + (comission / 100)
          }

          if (comission > 0) {
            config.comission = comission / 100
          } else {
            config.comission = comission
          }

          req.session.cart = { products: cart.products }
          res.render('partials/cart/credit', { checkout: cart, config: config })
        })
      })
      .catch((err) => {
        if (err) {
          res.redirect('/')
        }
      })
  },
  postPaiementCredit: (req, res) => {
    var id = req.params.cart
    var user = req.user._id

    // start with get cart data
    getCart(id)
      .then((cart) => {
        // console.log('1. cart: ', cart)
        // STIPE
        var stripeConfig = {
          amount: parseInt(cart.total_price * 100 + 50),
          currency: 'eur',
          description: id,
          // customer: String(user),
          source: req.body.stripeToken
        }

        // continue with stripe checkout API
        stripeProcess(cart, stripeConfig)
          .then((paiement) => {
            // console.log('2. Paiement: ', stripeConfig, paiement)
            // continue to update cart if stripe return a validate paiement

            updateCartPaiement(id, paiement)
              .then((checkout) => {
                // console.log('3. Checkout: ', checkout, cart)

                // remove session cart
                req.session.cart = { products: [] }

                // créer les inscriptions à compléter
                createRegistration(cart, paiement)
                  .then((val) => {
                    if (val.done) {
                      // créer la notification de paiement
                      var notification = new Notification({
                        receiver: [user],
                        message: 'Nous vous confirmons le paiement N°' + paiement.stripe_id + ' pour la commande N°' + id + '.'
                      })

                      // save notification
                      createNotificationAndSendEmail(notification, user)

                      // update cart : set registration created ok
                      setCartRegistrationOk(id)
                        .then((val) => {
                          // console.log(val)
                        })
                        .catch((err) => {
                          throw err
                        })

                      // REDIRECTION + HEADERS
                      req.flash('success_msg', 'Votre paiement à bien été pris en compte')
                      res.redirect('/inscription/recap/user/' + user)
                    }
                  })
                  .catch((err) => {
                    if (err) {
                      req.flash('error_msg', 'Une erreur est survenue lors de la création de vos formulaire d\'inscription, contactez le service client.')
                      res.redirect('/inscription/recap/user/' + user)
                    }
                  })
              })
              .catch((err) => {
                if (err) {
                  req.flash('error_msg', 'Une erreur est survenue lors de la mise à jours du statut de votre panier, contactez le service client.')
                  res.redirect('/inscription/recap/user/' + user)
                }
              })
          })
          .catch((err) => {
            if (err) {
              req.flash('error_msg', 'Une erreur est survenue lors du paiement.')
              res.redirect('/cart/checkout/credit')
            }
          })
      })
      .catch((err) => {
        if (err) {
          req.flash('error_msg', 'Une erreur est survenue, ce panier n\'existe pas.')
          res.redirect('/cart/checkout/credit')
        }
      })
  },
  getPaiementCheck: (req, res) => {
    var user = req.user._id
    var request = req

    finalCart(request)
      .then((checkout) => {
        var newCart = new Cart({
          user: user,
          products: checkout.products,
          total_price: Number(checkout.totalPrice)
        })

        newCart.save((err, savedCart) => {
          var id = savedCart._id
          if (err) {
            res.redirect('/cart')
          }
          // start with get cart data
          getCart(id)
            .then((cart) => {
              // console.log('1. cart: ', cart)

              // continue to update cart if stripe return a validate paiement
              var paiement = {
                'amount': cart.total_price,
                'check': true,
                'date': Date(Date.now()),
                'captured': false
              }

              updateCartPaiement(id, paiement)
                .then((checkout) => {
                  // console.log('3. Checkout: ', checkout, cart)

                  // remove session cart
                  req.session.cart = { products: [] }

                  // créer les inscriptions à compléter
                  createRegistration(cart, paiement)
                    .then((val) => {
                      if (val.done) {
                        // créer la notification de paiement
                        var notification = new Notification({
                          receiver: [user],
                          message: 'Nous avons bien transmis l\'inscription correspondant à la commande N°' + id + ' à  son organisateur. Notez cependant que pour valider votre inscription celui-ci attendra désormais votre paiement en direct, si possible avant le jour de l\'évenement.'
                        })

                        // save notification
                        createNotificationAndSendEmail(notification, user)

                        // update cart : set registration created ok
                        setCartRegistrationOk(id)
                          .then((val) => {
                            // console.log(val)
                          })
                          .catch((err) => {
                            throw err
                          })

                        // REDIRECTION + HEADERS
                        req.flash('success_msg', 'Votre inscription à bien été prise en compte')
                        res.redirect('/inscription/recap/user/' + user)
                      }
                    })
                    .catch((err) => {
                      if (err) {
                        req.flash('error_msg', 'Une erreur est survenue lors de la création de vos formulaire d\'inscription, contactez le service client.')
                        res.redirect('/inscription/recap/user/' + user)
                      }
                    })
                })
                .catch((err) => {
                  if (err) {
                    req.flash('error_msg', 'Une erreur est survenue lors de la mise à jours du statut de votre panier, contactez le service client.')
                    res.redirect('/inscription/recap/user/' + user)
                  }
                })
            })
            .catch((err) => {
              if (err) {
                req.flash('error_msg', 'Une erreur est survenue, ce panier n\'existe pas.')
                res.redirect('/cart/checkout/credit')
              }
            })
        })
      })
      .catch((err) => {
        if (err) {
          res.redirect('/cart')
        }
      })
  }
}

module.exports = cartCtrl
