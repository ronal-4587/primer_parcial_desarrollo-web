document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();

          
            const validUser = "Jaider";
            const validPass = "ortega123";

            if (usernameInput === validUser && passwordInput === validPass) {
                localStorage.setItem('userSession', validUser);
                window.location.href = "index.html";
            } else {
                alert("Error: Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.");
            }
        });
    }
});
