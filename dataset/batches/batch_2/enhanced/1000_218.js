setcpm(108/4)

$: s("bd ~ rim ~").speed(.9).gain(.7)

$: s("lt*4").room(.25).delay(.4).gain(.35).clip(1).release(.3).attack(.01)

$: n("2 5 3 5 8 7").scale("d:minor").s("sawtooth").lpf(1200).release(.2).gain(.4)
