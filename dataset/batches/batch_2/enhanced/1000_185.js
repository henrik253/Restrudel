setcpm(115/4)

$: s("bd*2 ~ sd bd*2").bank("RolandTR909").lpf(2000).room(.4).gain(.8)

$: s("hh*4").gain(.2)

$: note("a3 f4 c4 a3 f3 c4 g3 a3").sound("sawtooth").lpf(1800).gain(.35)

$: n("0 2").s("gm_electric_bass_finger").slow(2).gain(.4)
