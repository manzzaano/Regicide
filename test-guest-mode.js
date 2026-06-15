const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('error', err => console.error('[BROWSER ERROR]', err));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  console.log('📱 Abriendo http://localhost:4200...');
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });

  // Esperar a que cargue el login
  await page.waitForSelector('.auth-page', { timeout: 5000 });
  console.log('✅ Login cargado');

  // Analizar iconos y diseño
  const loginTitle = await page.locator('h1').textContent();
  const guestButton = await page.locator('button:has-text("JUGAR SIN CUENTA")').count();
  console.log(`\n🎨 Diseño Login:`);
  console.log(`   Título: ${loginTitle}`);
  console.log(`   Botón invitado: ${guestButton > 0 ? '✅ Visible' : '❌ No visible'}`);

  // Tomar screenshot del login
  await page.screenshot({ path: 'screenshot-login.png' });
  console.log('   📸 Screenshot guardado: screenshot-login.png');

  // Click en "Jugar sin cuenta"
  console.log('\n🎭 Haciendo click en "Jugar sin cuenta"...');
  // Ocultar webpack dev server overlay para evitar bloqueos
  await page.evaluate(() => {
    const iframe = document.querySelector('#webpack-dev-server-client-overlay');
    if (iframe) iframe.style.display = 'none';
  });
  await page.click('button:has-text("JUGAR SIN CUENTA")');

  // Esperar a que cargue la pantalla de juego
  await page.waitForSelector('.game-container', { timeout: 10000 });
  console.log('✅ Pantalla de juego cargada');

  // Esperar conexión WebSocket
  await page.waitForTimeout(2000);

  // Verificar banner invitado
  const guestBanner = await page.locator('.guest-banner').count();
  console.log(`\n👤 Modo Invitado:`);
  console.log(`   Banner: ${guestBanner > 0 ? '✅ Visible' : '⚠️ No visible'}`);

  // Encontrar botón "Iniciar Juego"
  const startButton = await page.locator('button:has-text("Iniciar Juego")').count();
  console.log(`   Botón inicio: ${startButton > 0 ? '✅ Visible' : '❌ No visible'}`);

  if (startButton > 0) {
    console.log('\n🎮 Iniciando partida...');
    await page.click('button:has-text("Iniciar Juego")');
    await page.waitForTimeout(3000);

    // Tomar screenshot de juego en progreso
    await page.screenshot({ path: 'screenshot-game.png' });
    console.log('   📸 Screenshot guardado: screenshot-game.png');

    // Analizar estado
    const gameContent = await page.locator('.game-board').count();
    const enemyArea = await page.locator('.enemy-area').count();
    const handArea = await page.locator('.hand').count();
    const connectionStatus = await page.locator('.connection-status.connected').count();

    console.log(`\n🎨 Elementos Visuales:`);
    console.log(`   Tablero: ${gameContent > 0 ? '✅' : '❌'}`);
    console.log(`   Área enemiga: ${enemyArea > 0 ? '✅' : '❌'}`);
    console.log(`   Mano de cartas: ${handArea > 0 ? '✅' : '❌'}`);
    console.log(`   WebSocket: ${connectionStatus > 0 ? '✅ Conectado' : '⚠️ Desconectado'}`);
  }

  console.log('\n✨ Test completado');
  console.log('📂 Screenshots guardados en directorio actual');

  await browser.close();
})();
