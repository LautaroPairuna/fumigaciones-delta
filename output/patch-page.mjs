import { readFileSync, writeFileSync } from "node:fs";

const pagePath = new URL("../index.html", import.meta.url);
let html = readFileSync(pagePath, "utf8");

const steps = `<div class="work-grid" data-reveal>
        <figure class="work-shot work-shot-hogar">
          <div class="work-photo"><img src="media/trabajo-hogar.jpg" alt="Técnico con equipo de protección aplicando gel en el zócalo de una cocina." width="864" height="1152" loading="lazy"></div>
          <figcaption><span>01</span><div><strong>Inspección</strong><p>Recorremos el lugar y marcamos el foco.</p></div></figcaption>
        </figure>
        <figure class="work-shot work-shot-edificio">
          <div class="work-photo"><img src="media/trabajo-edificio.jpg" alt="Técnico colocando una estación de control en el pasillo de un edificio." width="1152" height="864" loading="lazy"></div>
          <figcaption><span>02</span><div><strong>Tratamiento</strong><p>Aplicamos lo que ese foco necesita.</p></div></figcaption>
        </figure>
        <figure class="work-shot work-shot-comercio">
          <div class="work-photo"><img src="media/trabajo-comercio.jpg" alt="Técnico revisando el bajo mesada de una cocina comercial con linterna." width="864" height="1152" loading="lazy"></div>
          <figcaption><span>03</span><div><strong>Seguimiento</strong><p>Volvemos a mirar y ajustamos si hace falta.</p></div></figcaption>
        </figure>
      </div>`;

if (!html.includes('class="work-grid"')) throw new Error("work-grid missing");
html = html.replace(/<div class="work-grid" data-reveal>[\s\S]*?<div class="method-advise">[\s\S]*?<\/div><\/div><\/section>/, steps + "</div></section>");

const svg = readFileSync(new URL("./mapa-cobertura.svg", import.meta.url), "utf8").trim();
const coverage = `<section class="coverage-section" id="cobertura" aria-labelledby="coverage-title">
      <div class="coverage-scene">
        <img src="media/medianera-edificio.jpg" alt="" width="1280" height="720" loading="lazy">
        <div class="coverage-layout">
          <div class="coverage-copy">
            <p class="section-label">Área de cobertura</p>
            <h2 id="coverage-title">CABA y Gran<br>Buenos Aires.</h2>
            <p>Hogares, consorcios y comercios. Confirmamos tu barrio antes de la visita.</p>
            <a class="button coverage-cta" data-asesoria="zona" href="https://wa.me/?text=Hola%20Traza.%20Quiero%20consultar%20si%20atienden%20mi%20barrio." target="_blank" rel="noopener noreferrer">Consultar mi zona por WhatsApp<svg class="icon" aria-hidden="true"><use href="#i-chat"/></svg></a>
          </div>
          <figure class="coverage-map" data-reveal>
            ${svg}
            <figcaption>
              <span class="map-key"><i aria-hidden="true"></i>Zona de servicio</span>
              <span>CABA y 24 partidos</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
    <section class="channels" id="canales" aria-labelledby="channels-title">
      <div class="channels-inner">
        <h2 id="channels-title">Escribinos por donde prefieras.</h2>
        <div class="channel-row">
          <a class="channel channel-whatsapp" data-channel="whatsapp" href="https://wa.me/?text=Hola%20Traza.%20Quiero%20consultar%20por%20un%20servicio." target="_blank" rel="noopener noreferrer"><svg class="icon" aria-hidden="true"><use href="#i-whatsapp"/></svg><span>WhatsApp</span></a>
          <a class="channel channel-instagram" data-channel="instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><svg class="icon" aria-hidden="true"><use href="#i-instagram"/></svg><span>Instagram</span></a>
          <a class="channel channel-facebook" data-channel="facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><svg class="icon" aria-hidden="true"><use href="#i-facebook"/></svg><span>Facebook</span></a>
          <a class="channel channel-gmail" data-channel="gmail" href="mailto:?subject=Consulta%20Traza&amp;body=Hola%20Traza.%20Quiero%20consultar%20por%20un%20servicio."><svg class="icon" aria-hidden="true"><use href="#i-mail"/></svg><span>Gmail</span></a>
        </div>
      </div>
    </section>`;

if (!html.includes('class="coverage-section"')) throw new Error("coverage missing");
html = html.replace(/<section class="coverage-section"[\s\S]*?<\/section>/, coverage);
html = html.replace('<a href="#cobertura">Cobertura</a><a href="#cotizar">Contacto</a>', '<a href="#cobertura">Cobertura</a><a href="#canales">Canales</a><a href="#cotizar">Contacto</a>');

if (!html.includes('id="canales"') || !html.includes("amba-map") || html.includes("method-advise")) {
  throw new Error("patch incomplete");
}
writeFileSync(pagePath, html);
console.log("patched", html.length);
