// vite.config.js
import { defineConfig } from "file:///C:/Users/rafae/OneDrive/Desktop/Basilios---Projeto-de-PI-/basilios-auth-ui/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/rafae/OneDrive/Desktop/Basilios---Projeto-de-PI-/basilios-auth-ui/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/rafae/OneDrive/Desktop/Basilios---Projeto-de-PI-/basilios-auth-ui/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": {}
  },
  server: {
    proxy: {
      "/api/abacate": {
        target: "https://api.abacatepay.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/abacate/, "")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyYWZhZVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXEJhc2lsaW9zLS0tUHJvamV0by1kZS1QSS1cXFxcYmFzaWxpb3MtYXV0aC11aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmFmYWVcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxCYXNpbGlvcy0tLVByb2pldG8tZGUtUEktXFxcXGJhc2lsaW9zLWF1dGgtdWlcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3JhZmFlL09uZURyaXZlL0Rlc2t0b3AvQmFzaWxpb3MtLS1Qcm9qZXRvLWRlLVBJLS9iYXNpbGlvcy1hdXRoLXVpL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcIkB0YWlsd2luZGNzcy92aXRlXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcclxuICBkZWZpbmU6IHtcclxuICAgIFwicHJvY2Vzcy5lbnZcIjoge30sXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIFwiL2FwaS9hYmFjYXRlXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkuYWJhY2F0ZXBheS5jb21cIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2FiYWNhdGUvLCBcIlwiKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFosU0FBUyxvQkFBb0I7QUFDM2IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsRUFDaEMsUUFBUTtBQUFBLElBQ04sZUFBZSxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLG1CQUFtQixFQUFFO0FBQUEsTUFDdkQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
