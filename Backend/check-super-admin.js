import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const SuperAdmin = (await import('./src/models/SuperAdmin.js')).default;

console.log('🔍 CHECKING SUPER ADMIN');
console.log('========================');

try {
  // Check if Super Admin exists
  const superAdmin = await SuperAdmin.findOne({ email: 'super@admin.com' });
  
  if (superAdmin) {
    console.log('✅ Super Admin found:', {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role
    });
    
    // Test password
    const passwordMatch = await superAdmin.matchPassword('123456');
    console.log('🔐 Password match test:', passwordMatch);
    
  } else {
    console.log('❌ Super Admin not found');
    
    // Create Super Admin
    console.log('🔧 Creating Super Admin...');
    const newSuperAdmin = await SuperAdmin.create({
      name: 'Super Admin',
      email: 'super@admin.com',
      password: '123456'
    });
    
    console.log('✅ Super Admin created:', {
      id: newSuperAdmin._id,
      name: newSuperAdmin.name,
      email: newSuperAdmin.email,
      role: newSuperAdmin.role
    });
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  mongoose.disconnect();
  console.log('🔌 Database disconnected');
}