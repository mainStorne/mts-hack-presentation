"""Rebuild a single offline HTML file from editable source files."""
from pathlib import Path
import re,base64
root=Path(__file__).resolve().parent
html=(root/'index.html').read_text()
css=(root/'masters.css').read_text()
def font(match):
    path=root/match.group(1)
    return 'url(data:font/woff2;base64,'+base64.b64encode(path.read_bytes()).decode()+')'
css=re.sub(r'url\((fonts/[^)]+)\)',font,css)
html=html.replace('<link rel="stylesheet" href="masters.css">','<style>\n'+css+'\n</style>')
logo='data:image/svg+xml;base64,'+base64.b64encode((root/'mws-mark.svg').read_bytes()).decode()
html=html.replace('src="mws-mark.svg"','src="'+logo+'"')
chart='data:image/svg+xml;base64,'+base64.b64encode((root/'resources-quality.svg').read_bytes()).decode()
html=html.replace('src="resources-quality.svg"','src="'+chart+'"')
for qr in ('qr-github','qr-slides'):
    html=html.replace('src="assets/'+qr+'.svg"','src="data:image/svg+xml;base64,'+base64.b64encode((root/'assets'/(qr+'.svg')).read_bytes()).decode()+'"')
poster='data:image/png;base64,'+base64.b64encode((root/'assets'/'demo-poster.png').read_bytes()).decode()
html=html.replace('assets/demo-poster.png',poster)
html=html.replace('src="exports/inference-demo.mp4"','src="data:video/mp4;base64,'+base64.b64encode((root/'exports'/'inference-demo.mp4').read_bytes()).decode()+'"')
import glob
for f in sorted(glob.glob(str(root/'assets/team/*.png'))):
    rel='assets/team/'+Path(f).name
    html=html.replace('src="'+rel+'"','src="data:image/png;base64,'+base64.b64encode(Path(f).read_bytes()).decode()+'"')
for name in ['data.js','charts.js','deck.js']:
    js=(root/name).read_text().replace('</script','<\\/script')
    html=html.replace('<script src="'+name+'"></script>','<script>\n'+js+'\n</script>')
out=root/'mws-master-slides.html'
out.write_text(html)
print(out)
