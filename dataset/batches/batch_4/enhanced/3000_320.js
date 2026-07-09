setcpm(110)

$: note("c4*2 c4 a#3 c4").sound("hh ~").lpf(306).hpf(8000).gain(0.90).release(1.1049).attack(.0396)
$: n("0 1 2 3").sound("bd rim").lpf(2000).gain(0.35).clip(.95).release(.5)
