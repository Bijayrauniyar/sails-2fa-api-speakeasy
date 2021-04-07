/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    email: {
      type: 'string',
      required: true,
      unique: true,
      // maxLength: 200,
      // example: 'mary.sue@example.com'
    },
    name: {
      type: 'string',
      required: true,
      // description: 'Full representation of the user\'s name.',
      // maxLength: 120,
      // example: 'Mary Sue van der McHenst'
    },
    password: {
      type: 'string',
      required: true,
      // description: 'Securely hashed representation of the user\'s login password.',
      // protect: true,
      // example: '2$28a8eabna301089103-13948134nad'
    },
    tempSecret: {
      type: 'string',
    },
    otpauthUrl: {
      type: 'string',
    },
  }
};

