from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
page = (root / 'index.html').read_text(encoding='utf-8')
hero = '''    <section class="experience-hero" id="inicio" aria-labelledby="hero-title">
      <div class="experience-intro">
        <p class="experience-location"><svg class="icon" aria-hidden="true"><use href="#i-target"/></svg> Fumigaciones y control de plagas</p>
        <h1 id="hero-title">Cada plaga<br> deja una traza.</h1>
        <p class="experience-lead">Una junta. Un recorrido. Un pequeño rastro.<br> Miramos donde el problema empieza para cuidar todo lo que viene después.</p>
        <div class="experience-actions">
          <button type="button" class="button inspection-activate" data-inspection-toggle aria-pressed="false" aria-controls="inspection-points"><svg class="icon" aria-hidden="true"><use href="#i-target"/></svg><span data-inspection-toggle-label>Activar mirada experta</span></button>
          <a href="#cotizar" class="experience-quote">Ya sé lo que necesito. Quiero cotizar<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        </div>
        <div class="experience-foot"><span>CABA y Gran Buenos Aires</span><a href="#plagas">Seguí la traza <span aria-hidden="true">↓</span></a></div>
        <span class="hero-watermark" aria-hidden="true" translate="no">traza</span>
      </div>
      <div class="inspection-scene" data-inspection-scene>
        <div class="inspection-image">
          <img src="media/hero-cocina.jpg" alt="Cocina profesional usada como ejemplo para explorar puntos de inspección" width="1280" height="720" fetchpriority="high">
          <video id="hero-video" muted loop playsinline preload="none" poster="media/hero-cocina.jpg" aria-hidden="true" tabindex="-1"><source data-src="media/hero-cocina.mp4" type="video/mp4"></video>
          <div class="inspection-topbar"><span><span class="inspection-led" aria-hidden="true"></span>Recorrido ilustrativo</span><button class="inspection-video" data-video-toggle type="button" aria-label="Pausar video"><span class="video-control-icon" aria-hidden="true">Ⅱ</span><span data-video-label>Pausar video</span></button></div>
          <div class="inspection-corners" aria-hidden="true"></div>
          <div class="inspection-overlay" id="inspection-points" data-inspection-overlay hidden>
            <svg class="inspection-route" viewBox="0 0 640 520" preserveAspectRatio="none" aria-hidden="true"><path d="M35 465H285V375L455 240H530V338H610"/><circle cx="455" cy="240" r="42"/><circle cx="285" cy="375" r="42"/><circle cx="530" cy="338" r="42"/></svg>
            <button class="inspection-point point-refugios" data-inspection-point="refugios" type="button" aria-pressed="true" aria-controls="inspection-detail"><span class="point-number">01</span><span class="point-name">Refugios</span></button>
            <button class="inspection-point point-accesos" data-inspection-point="accesos" type="button" aria-pressed="false" aria-controls="inspection-detail"><span class="point-number">02</span><span class="point-name">Accesos</span></button>
            <button class="inspection-point point-humedad" data-inspection-point="humedad" type="button" aria-pressed="false" aria-controls="inspection-detail"><span class="point-number">03</span><span class="point-name">Humedad</span></button>
          </div>
          <span class="inspection-caption">Lo cotidiano, bajo otra mirada.</span>
        </div>
        <div class="inspection-detail" id="inspection-detail" data-inspection-detail><span class="inspection-index" data-inspection-index>Vista habitual</span><div><h2 data-inspection-title>Un espacio cotidiano.</h2><p data-inspection-text>Activá la mirada experta y explorá tres puntos que se revisan durante una inspección.</p></div><svg class="icon" aria-hidden="true"><use href="#i-target"/></svg></div>
      </div>
      <p class="sr-only" data-inspection-status aria-live="polite"></p>
    </section>
    <nav class="trace-route container" aria-label="Recorrido para conocer el servicio"><a href="#inicio"><span>01</span>Leer el espacio</a><span class="trace-connector" aria-hidden="true"></span><a href="#plagas"><span>02</span>Entender la plaga</a><span class="trace-connector" aria-hidden="true"></span><a href="#servicios"><span>03</span>Elegir el tratamiento</a></nav>
'''
page, count = re.subn(r'    <section class="hero".*?<div class="audience-bar.*?</div>', hero, page, count=1, flags=re.S)
assert count == 1, 'Hero replacement not found'

pests = [
    {'key':'cucarachas','label':'Cucarachas','img':'cucaracha','category':'Insectos rastreros','heading':'El refugio es parte del problema.','desc':'Juntas, rincones oscuros y espacios junto a fuentes de agua o alimento. La inspección busca entender dónde se concentra la actividad.','look':'Detrás de equipos, bajo mesadas y junto a zócalos.','plan':'Identificación, monitoreo y tratamiento focalizado según el caso.','cue':'Refugios y actividad','ref':'cockroaches'},
    {'key':'hormigas','label':'Hormigas','img':'hormiga','category':'Insectos sociales','heading':'El recorrido cuenta una historia.','desc':'Una hilera conecta puntos. Observar por dónde entran y hacia dónde se dirigen ayuda a entender la actividad y a definir el abordaje.','look':'Bordes, encuentros de paredes y aberturas hacia el exterior.','plan':'Relevamiento de recorridos, accesos y fuentes de alimento.','cue':'Recorridos y accesos','ref':'ants'},
    {'key':'roedores','label':'Roedores','img':'roedor','category':'Ratas y ratones','heading':'Hay que encontrar por dónde llegan.','desc':'Las marcas de roído y otros rastros orientan la inspección. El control también necesita revisar posibles entradas y refugios.','look':'Pasos de instalaciones, depósitos y sectores de residuos.','plan':'Monitoreo, dispositivos adecuados y medidas para limitar el acceso.','cue':'Rastros y entradas','ref':'house-mouse'},
    {'key':'mosquitos','label':'Mosquitos','img':'mosquito','category':'Insectos voladores','heading':'La mirada empieza en el entorno.','desc':'El agua acumulada puede ofrecer sitios de cría. Revisar recipientes, desagües y el uso del jardín es parte de un enfoque preventivo.','look':'Recipientes con agua, canaletas y otros puntos de acumulación.','plan':'Relevamiento de focos y una intervención acorde al espacio.','cue':'Agua y entorno','ref':'mosquitoes'}
]
guide = '''
    <section class="pest-guide" id="plagas" aria-labelledby="pest-guide-title">
      <div class="container">
        <div class="guide-heading"><div><p class="section-label">Guía de campo Traza</p><h2 id="pest-guide-title">Para controlarla,<br> primero hay que entenderla.</h2></div><p>Cada especie tiene su lógica.<br> Elegí una y descubrí qué buscamos.</p></div>
        <div class="pest-tabs" role="tablist" aria-label="Explorar tipos de plagas">'''
for i,p in enumerate(pests):
    guide += f'''<button type="button" role="tab" id="pest-tab-{p['key']}" aria-controls="pest-panel-{p['key']}" aria-selected="{'true' if i == 0 else 'false'}" tabindex="{0 if i == 0 else -1}" data-pest-tab="{p['key']}"><img src="media/plaga-{p['img']}.svg" alt="" width="480" height="400" loading="lazy"><span>{p['label']}</span><svg class="icon" aria-hidden="true"><use href="#i-diagonal"/></svg></button>'''
guide += '</div>'
for i,p in enumerate(pests):
    guide += f'''
        <div class="pest-panel" id="pest-panel-{p['key']}" role="tabpanel" aria-labelledby="pest-tab-{p['key']}" tabindex="0" data-pest-panel="{p['key']}"{' hidden' if i else ''}>
          <figure class="specimen-plate">
            <div class="specimen-plate-top"><span>{p['category']}</span><span>Vista ampliada</span></div>
            <div class="specimen-orbit" aria-hidden="true"></div><div class="specimen-crosshair" aria-hidden="true"></div>
            <img class="specimen-image" src="media/plaga-{p['img']}.svg" alt="Ilustración de referencia de {'un roedor' if p['key']=='roedores' else 'un mosquito' if p['key']=='mosquitos' else 'una '+p['img']}" width="480" height="400" loading="lazy" decoding="async">
            <figcaption><span class="specimen-ruler" aria-hidden="true"></span>Ilustración de referencia · Sin escala real</figcaption>
          </figure>
          <div class="pest-dossier"><span class="dossier-type">{p['cue']}</span><h3>{p['heading']}</h3><p>{p['desc']}</p><dl><div><dt>La inspección</dt><dd>{p['look']}</dd></div><div><dt>El abordaje</dt><dd>{p['plan']}</dd></div></dl><a class="text-link" href="#cotizar" data-pest-quote="{p['key']}">Consultar por {p['label'].lower()}<svg class="icon" aria-hidden="true"><use href="#i-diagonal"/></svg></a><a class="field-source" href="https://ipm.ucanr.edu/home-and-landscape/{p['ref']}/" target="_blank" rel="noopener noreferrer">Referencia técnica: UC IPM <span aria-hidden="true">↗</span><span class="sr-only"> (abre en otra pestaña)</span></a></div>
        </div>'''
guide += '''<div class="guide-foot"><p>¿No reconocés lo que viste? Esa también es una buena primera pista.</p><a class="text-link" href="#cotizar">Describir lo que observé<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></div></div></section>
'''
page = page.replace('    <section class="section services-section', guide + '\n    <section class="section services-section', 1)
page = page.replace('<meta name="theme-color" content="#f7f9fb">', '<meta name="theme-color" content="#f0f1eb">')
page = page.replace('family=Manrope:', 'family=Archivo:wght@400;500;600;700;800&family=Manrope:')
page = page.replace('<link rel="stylesheet" href="css/styles.css">', '<link rel="stylesheet" href="css/styles.css">\n  <link rel="stylesheet" href="css/experience.css">')
page = page.replace('<script src="js/main.js" defer></script>', '<script src="js/main.js" defer></script>\n  <script src="js/experience.js" defer></script>')
page = page.replace('<nav class="site-nav" id="site-nav" aria-label="Navegación principal">', '<nav class="site-nav" id="site-nav" aria-label="Navegación principal"><a href="#plagas">Las plagas</a>')
page = page.replace('Cada espacio tiene<br> su solución.', 'El tratamiento sigue<br> la forma de tu espacio.')
page = page.replace('Cuidar tu espacio<br> es cuidar tu<br> tranquilidad.', 'El detalle cambia<br> el tratamiento.')
page = page.replace('En Traza, el control de plagas empieza por escuchar. Cada hogar, cada negocio y cada edificio tiene una rutina que merece ser respetada.', 'Una junta abierta. Un rastro junto al zócalo. Un punto que vuelve a registrar actividad. En Traza, leemos esas señales antes de definir cómo intervenir.')
page = page.replace('Por eso, nuestro enfoque combina diagnóstico, intervención y prevención. Con información clara, desde la primera consulta.', 'El trabajo conecta lo que ves con lo que sucede en tu espacio: inspección, tratamiento y prevención, con un alcance claro desde la primera consulta.')
page = page.replace('Entender antes de actuar.', 'Encontrar el foco.').replace('La plaga, el ambiente y su uso definen el tratamiento. La solución empieza con un diagnóstico.', 'Cocinas, depósitos y pasos de cañerías. Revisamos dónde aparece la actividad y cómo se conecta con el resto del espacio.')
page = page.replace('Todo claro, desde el inicio.', 'Elegir la herramienta.').replace('Alcance, preparación del espacio y próximos pasos. La información que necesitás para decidir.', 'Gel, estaciones de monitoreo o tratamiento de superficies: cada recurso responde a una plaga y a un ambiente.')
page = page.replace('Mirar más allá de la visita.', 'Volver a observar.').replace('Prevenir nuevos focos también es parte del cuidado. Definimos el seguimiento que requiere cada caso.', 'Comparar actividad, revisar puntos tratados y ajustar la prevención. El seguimiento se acuerda según el servicio.')
page = page.replace('De la preocupación<br> a un plan claro.', 'Del primer rastro<br> al próximo control.')
page = page.replace('Un espacio cuidado<br> empieza con<br> una conversación.', 'Contanos<br> qué traza<br> encontraste.')
page = page.replace('Hablemos de<br> tu espacio.', 'El próximo paso<br> lo damos juntos.')
page = page.replace('Espacios cuidados.<br> Personas tranquilas.', 'Leemos las señales.<br> Cuidamos tu espacio.')
(root / 'index.html').write_text(page, encoding='utf-8')
print('Hero, field guide, navigation and editorial content updated.')
