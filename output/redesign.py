from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
page = root / 'index.html'
html = page.read_text(encoding='utf-8')
html = html.replace('<link rel="preload" as="image" href="media/hero-cocina.jpg" fetchpriority="high">\n  ', '')
html = html.replace('<script src="js/experience.js" defer></script>\n', '')
html = html.replace('<nav class="site-nav" id="site-nav" aria-label="Navegación principal"><a href="#plagas">Plagas y espacios</a><a href="#metodo">Cómo trabajamos</a><a href="#cobertura">Cobertura</a><a href="#contacto">Contacto</a><a class="button button-small" href="#cotizar">Cotizar mi espacio<svg class="icon" aria-hidden="true"><use href="#i-diagonal"/></svg></a></nav>', '<nav class="site-nav" id="site-nav" aria-label="Navegación principal"><div class="nav-links"><a href="#inicio">Inicio</a><a href="#plagas">Plagas</a><a href="#metodo">Método</a><a href="#cobertura">Cobertura</a><a href="#cotizar">Contacto</a></div><a class="button button-small nav-cta" href="#cotizar">Pedir presupuesto<svg class="icon" aria-hidden="true"><use href="#i-diagonal"/></svg></a></nav>')
hero = '''<section class="experience-hero" id="inicio" aria-labelledby="hero-title">
      <div class="hero-backdrop" aria-hidden="true">
        <img src="media/inicio-fondo-poster.jpg" alt="" width="1280" height="720" fetchpriority="high">
        <video id="hero-backdrop-video" muted loop playsinline preload="none" poster="media/inicio-fondo-poster.jpg" tabindex="-1"><source data-src="media/inicio-fondo.mp4" type="video/mp4"></video>
      </div>
      <div class="hero-copy container">
        <p class="experience-location">Control de plagas en CABA y GBA</p>
        <h1 id="hero-title">Volvé a sentir<br>tu espacio propio.</h1>
        <p class="experience-lead">Detectamos el problema, tratamos el foco y te ayudamos a prevenirlo.</p>
        <div class="experience-actions"><a href="#cotizar" class="button hero-primary">Pedir presupuesto<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a><a href="#plagas" class="hero-secondary">Ver qué tratamos <span aria-hidden="true">↓</span></a></div>
      </div>
      <div class="hero-bottom container"><span>Hogares · Consorcios · Comercios</span><button class="hero-video-toggle" type="button" data-video-toggle aria-label="Pausar video" aria-pressed="true"><span class="video-control-icon" aria-hidden="true">Ⅱ</span><span data-video-label>Pausar video</span></button></div>
    </section>'''
html = re.sub(r'<section class="experience-hero".*?</section>', hero, html, count=1, flags=re.S)
html = html.replace('La plaga, el lugar<br> y la solución.', 'Identificamos el problema.<br>Tratamos el foco.')
html = html.replace('Un panorama rápido para reconocer el problema. Si no sabés qué plaga es, describinos lo que viste.', 'Control para los problemas más frecuentes en hogares y espacios de trabajo.')
html = re.sub(r'<dl><div><dt>Se esconden</dt>.*?</dl>', '', html, count=1, flags=re.S)
html = re.sub(r'<div class="catalog-bottom">.*?</div>\s*</div>\s*</section>', '</div>\n    </section>', html, count=1, flags=re.S)
html = html.replace('Una intervención<br> pensada para tu espacio.', 'Un plan claro para<br>cada espacio.')
html = html.replace('El tratamiento depende de la plaga, el ambiente y la actividad que encontramos. Te explicamos el alcance antes de intervenir.', 'Primero entendemos qué pasa. Después definimos el tratamiento y te explicamos cada paso.')
html = html.replace('Tu problema empieza a resolverse acá.', 'Contanos qué está pasando.')
html = html.replace('Contanos quién sos y qué está pasando. Preparamos tu mensaje para que un asesor de Traza pueda continuar la conversación.', 'En dos mensajes preparamos tu consulta para seguir por WhatsApp.')
html = re.sub(r'\s*<span class="quote-side-note">.*?</span>', '', html, count=1, flags=re.S)
html = html.replace('Trabajamos en la Ciudad de Buenos Aires y localidades del GBA. Indicá tu barrio o localidad para confirmar disponibilidad.', 'Decinos tu barrio o localidad y confirmamos la disponibilidad.')
html = re.sub(r'<div class="coverage-map">.*?</div></div></section>', '<p class="coverage-note">Atención en hogares, consorcios y comercios. Consultá por tu zona al pedir presupuesto.</p></div></section>', html, count=1, flags=re.S)
html = re.sub(r'\s*<section class="contact-new".*?</section>', '', html, count=1, flags=re.S)
html = html.replace('<a href="#contacto">Contacto</a>', '<a href="#cotizar">Contacto</a>')
page.write_text(html, encoding='utf-8')
