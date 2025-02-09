const getUserProfile = (req, res) => {
    res.json({ message: 'Perfil do usuário' });
  };
  
  module.exports = {
    getUserProfile,
  };