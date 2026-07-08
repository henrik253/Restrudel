setcpm(100/4)

$: s("bd rim").lpf(800).gain(.7)

$: note("e4 c4 e4").s("sawtooth").lpf(1200).gain(.4)

$: s("mt").slow(2).gain(.4)

$: s("hh*8").gain(.2)
