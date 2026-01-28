import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error("❌ MONGO_URI not found in environment variables");
      console.log("💡 Please create a .env file with MONGO_URI");
      console.log("💡 Example: MONGO_URI=mongodb://localhost:27017/community-saas");
      console.log("💡 Or use MongoDB Atlas: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");
    console.log("   URI:", mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    const options = {
      // Remove deprecated options and use modern ones
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(mongoURI, options);
    console.log("✅ MongoDB Connected Successfully");
    console.log("   Database:", mongoose.connection.name);
    console.log("   Host:", mongoose.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error("   Error:", error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error("\n💡 Connection Refused - Possible issues:");
      console.error("   • MongoDB server is not running");
      console.error("   • Wrong host/port in MONGO_URI");
      console.error("   • Firewall blocking connection");
      console.error("   • For MongoDB Atlas: Check network access settings");
    } else if (error.message.includes('authentication failed')) {
      console.error("\n💡 Authentication Failed - Check:");
      console.error("   • Username and password in MONGO_URI");
      console.error("   • Database user has correct permissions");
    } else if (error.message.includes('querySrv')) {
      console.error("\n💡 DNS/Network Issue - Check:");
      console.error("   • Internet connection");
      console.error("   • MongoDB Atlas cluster is running");
      console.error("   • Network access in MongoDB Atlas is configured");
    }
    
    console.error("\n⚠️  Server will continue but database operations will fail");
    console.error("⚠️  Please fix MongoDB connection and restart server");
    // Don't exit - let server run without DB for testing
    // process.exit(1);
  }
};

export default connectDB;
