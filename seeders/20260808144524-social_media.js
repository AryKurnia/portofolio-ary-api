'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('social_media', [
      {
        platform: 'instagram',
        url: 'https://instagram.com/aryk922/',
        username: 'aryk922',
        enabled: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        platform: 'linkedIn',
        url: 'https://www.linkedin.com/in/arykurnia/',
        username: 'Ary Kurnia',
        enabled: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        platform: 'github',
        url: 'https://github.com/AryKurnia',
        username: 'AryKurnia',
        enabled: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        platform: 'facebook',
        url: 'https://www.facebook.com/ary.kurnia.922',
        username: 'Ary Kurnia',
        enabled: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        platform: 'twitter',
        url: 'https://x.com/AryK922',
        username: 'AryK922',
        enabled: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('social_media', null, {});
  }
};
