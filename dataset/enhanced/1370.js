setcpm(120/4)

$: s("bd*4 ~ bd ~").gain(.85)

$: s("woodblock:1 woodblock:2*2 ~").room(.5).gain(.3)

$: note("b@2 f@2 ~ b").s("sawtooth").lpf(300).release(.2).gain(.4)

$: note("<c4 e4 g4> b3 d4 g4").s("gm_drawbar_organ").lpf(1600).room(.4).gain(.35)
