import { Controller, Get, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  @Public()
  getRegisterPage(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Înregistrare Utilizator - Schele Management</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input, select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        button:active {
            transform: translateY(0);
        }
        .message {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
            font-size: 14px;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 4px;
            font-size: 13px;
            color: #1565C0;
        }
        .role-info {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            font-style: italic;
        }
        .loading {
            display: none;
            text-align: center;
            margin-top: 10px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏗️ Înregistrare Utilizator</h1>
        <p class="subtitle">Schele Management System</p>
        
        <div class="info-box">
            <strong>ℹ️ Notă:</strong> Primul utilizator creat va fi Administrator automat. 
            Utilizatorii următori trebuie creați de un Administrator.
        </div>

        <form id="registerForm">
            <div class="form-group">
                <label for="name">Nume Complet *</label>
                <input type="text" id="name" name="name" required placeholder="Ex: Ion Popescu">
            </div>

            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required placeholder="exemplu@email.com">
            </div>

            <div class="form-group">
                <label for="password">Parolă *</label>
                <input type="password" id="password" name="password" required 
                       placeholder="Minim 6 caractere" minlength="6">
            </div>

            <div class="form-group">
                <label for="role">Rol *</label>
                <select id="role" name="role" required>
                    <option value="">Selectează rol...</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="OPERATOR">Operator</option>
                    <option value="ACCOUNTING">Contabil</option>
                    <option value="CLIENT">Client</option>
                </select>
                <div class="role-info" id="roleInfo"></div>
            </div>

            <button type="submit">Creează Cont</button>
        </form>

        <div class="loading" id="loading">
            <div class="spinner"></div>
        </div>

        <div class="message" id="message"></div>
    </div>

    <script>
        const roleDescriptions = {
            'ADMIN': 'Acces complet la toate funcțiile sistemului',
            'OPERATOR': 'Gestionare schele și rapoarte de lucru',
            'ACCOUNTING': 'Gestionare facturi și date financiare',
            'CLIENT': 'Acces doar la propriile date (citire)'
        };

        document.getElementById('role').addEventListener('change', function(e) {
            const roleInfo = document.getElementById('roleInfo');
            roleInfo.textContent = roleDescriptions[e.target.value] || '';
        });

        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button');
            const loading = document.getElementById('loading');
            const message = document.getElementById('message');
            
            // Hide previous messages
            message.style.display = 'none';
            
            // Show loading
            button.disabled = true;
            loading.style.display = 'block';
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            };
            
            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                loading.style.display = 'none';
                button.disabled = false;
                
                if (response.ok) {
                    message.className = 'message success';
                    message.innerHTML = '<strong>✅ Succes!</strong><br>' +
                        'Contul a fost creat cu succes!<br>' +
                        'Email: ' + data.email + '<br>' +
                        'Rol: ' + data.role + '<br><br>' +
                        'Poți acum să te autentifici folosind aceste credențiale.';
                    message.style.display = 'block';
                    
                    // Reset form
                    this.reset();
                    document.getElementById('roleInfo').textContent = '';
                } else {
                    throw new Error(data.message || 'Eroare la înregistrare');
                }
            } catch (error) {
                loading.style.display = 'none';
                button.disabled = false;
                
                message.className = 'message error';
                message.innerHTML = '<strong>❌ Eroare!</strong><br>' + error.message;
                message.style.display = 'block';
            }
        });
    </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('login')
  @Public()
  getLoginPage(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autentificare - Schele Management</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        button:active {
            transform: translateY(0);
        }
        .message {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
            font-size: 14px;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .loading {
            display: none;
            text-align: center;
            margin-top: 10px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .links {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
        }
        .links a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        .links a:hover {
            text-decoration: underline;
        }
        .token-display {
            margin-top: 15px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            word-break: break-all;
            font-size: 12px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Autentificare</h1>
        <p class="subtitle">Schele Management System</p>

        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required placeholder="exemplu@email.com" autofocus>
            </div>

            <div class="form-group">
                <label for="password">Parolă *</label>
                <input type="password" id="password" name="password" required placeholder="Introdu parola">
            </div>

            <button type="submit">Autentificare</button>
        </form>

        <div class="loading" id="loading">
            <div class="spinner"></div>
        </div>

        <div class="message" id="message"></div>

        <div class="links">
            <a href="/auth/register">Nu ai cont? Înregistrează-te</a> | 
            <a href="/api">API Info</a>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button');
            const loading = document.getElementById('loading');
            const message = document.getElementById('message');
            
            // Hide previous messages
            message.style.display = 'none';
            
            // Show loading
            button.disabled = true;
            loading.style.display = 'block';
            
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                loading.style.display = 'none';
                button.disabled = false;
                
                if (response.ok) {
                    // Store token in localStorage
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    message.className = 'message success';
                    message.innerHTML = '<strong>✅ Autentificare reușită!</strong><br>' +
                        'Bine ai revenit, ' + data.user.name + '!<br>' +
                        'Rol: ' + data.user.role + '<br><br>' +
                        '<strong>Token-ul tău JWT:</strong>' +
                        '<div class="token-display">' + data.access_token + '</div>' +
                        '<br><small>Token-ul a fost salvat în localStorage și poate fi folosit pentru apeluri API.</small>';
                    message.style.display = 'block';
                    
                    // Reset form
                    this.reset();
                    
                    // Redirect to frontend dashboard after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'http://localhost:3000/dashboard';
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Eroare la autentificare');
                }
            } catch (error) {
                loading.style.display = 'none';
                button.disabled = false;
                
                message.className = 'message error';
                message.innerHTML = '<strong>❌ Eroare!</strong><br>' + error.message;
                message.style.display = 'block';
            }
        });

        // Check if already logged in
        window.addEventListener('load', function() {
            const token = localStorage.getItem('access_token');
            const user = localStorage.getItem('user');
            
            if (token && user) {
                const userData = JSON.parse(user);
                const message = document.getElementById('message');
                message.className = 'message success';
                message.innerHTML = '<strong>ℹ️ Ești deja autentificat</strong><br>' +
                    'Conectat ca: ' + userData.name + ' (' + userData.role + ')<br><br>' +
                    '<a href="#" onclick="localStorage.clear(); location.reload();" style="color: #667eea;">Deconectează-te</a>';
                message.style.display = 'block';
            }
        });
    </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    // Return user directly for frontend compatibility
    return user;
  }

  @Get('verify')
  async verifyToken(@CurrentUser() user: any) {
    return {
      valid: true,
      user,
    };
  }
}
