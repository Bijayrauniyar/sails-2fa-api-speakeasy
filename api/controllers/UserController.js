/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const speakeasy = require('speakeasy')
const qrcode = require('qrcode');

module.exports = {
  dashboard: async function (req, res) {
    const user = await User.findOne({ id: req.session.userId })
    if(!user || !req.session.isAuthenticated){
      return res.badRequest('You are not logged in. Please log in then setup 2FA');
    }
     user.isAuthenticated=true;
    return res.send(user);
    
  },

  twoFactorSetup: async function (req, res) {
    const secret = speakeasy.generateSecret({ name: 'Danfebooks' });
    console.log(secret, 'secret')
    console.log(req.session.userId, 'session id')

    if (!req.session.userId) {
      return res.badRequest('You are not logged in. Please log in then setup 2FA');
    }

    const updatedUser = await User.update({ id: req.session.userId })
      .set({ tempSecret: secret.base32, otpauthUrl: secret.otpauth_url })
    console.log(updatedUser, 'updated user')

    if (!updatedUser) {
      return res.badRequest('user not fount');
    }
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      return res.send(
        `<h1>Setup Authentication</h1>
            <h3>use the qr code auth app</h3>
            <img src=${data_url}> <br>
            or add manually:${secret.base32}`
      )
    })
  },

  verifyToken: async function (req, res) {
    const token = req.body.userToken;
    const user = await User.findOne({ id: req.session.userId })
    console.log(user, 'user value is here')

    if (!user) {
      return res.badRequest('You are not logged in. Please log in then setup 2FA');
    }
    const verified = speakeasy.totp.verify({ secret: user.tempSecret, encoding: 'base32', token: token })
    req.session.isAuthenticated=verified;
    res.status(200).send({ sucess: verified })
  },

  login: async function (req, res) {
    const data = req.body;
    const user = await User.findOne({ email: data.email })

    if (!user) {
      sails.log('Could not find User, sorry.');
      return res.badRequest('Could not find User, sorry.');
    }

    req.session.userId = user.id;
    res.status(200).send('User email and password is match');


  },

  signup: async function (req, res) {
    const { email, name, password } = req.body;
    User.create(
      {
        email: email,
        name: name,
        password: password,
        tempSecret: '',
        otpauthUrl: ''
      }
    ).exec(function (err, user) {
      if (err) {
        if (err.code == 'E_VALIDATION') {
          const key = Object.keys(err.invalidAttributes)[0];
          const message = err.invalidAttributes[key][0]['message'];
          return res.badRequest(message, 'asdfasd');
        } else return res.serverError(err);
      }

      if (user) {
        if (err) return res.serverError(err);

        const response = {
          data: user.toJSON(true)
        };
        response.data.new = true;
        if (user) {
          user.save((err) => {
            if (err) return res.serverError(err);
            return res.created(response);
          });
        }
      } else res.serverError('This should not happen.');
    });
  },
};

