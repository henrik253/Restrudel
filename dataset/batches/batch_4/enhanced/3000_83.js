setcpm(30/4)

$: s("bd:1 ~ sd:1 ~").gain(.8)

$: s("[hh hh*2]*4").gain(.25)

$: n("0 ~ 5 ~").scale("c3:major").s("sawtooth").gain(.4).lpf(800).release(.1)

$: n("0 3 7 5").scale("c4:major").s("square").gain(.3).lpf(2000).resonance(1).release(.2)
