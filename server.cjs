(async () => {
  try {
    const { default: app } = await import('./app.js');
    const colors = (await import('colors')).default;

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.log(`Error: ${err.message}`.red);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();
