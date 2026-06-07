module.exports = {
  async up(db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  },

  async down(db) {
    await db.collection('users').dropIndex('email_1');
  },
};
