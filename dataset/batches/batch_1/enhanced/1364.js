setcpm(112/4)

$: s("bd ~ sd ~").bank("Latin").gain(.8)

$: s("gtr ~ lt ~").bank("Latin").gain(.35)

$: s("hh*8").gain(.16)

$: n("2 0@3 ~ 3 ~ 1 ~ 2 3 -4 -3 4").scale("d:dorian").s("sawtooth").lpf(1200).release(.2).room(.3).gain(.4)

$: n("0 ~ -3 ~").scale("d:dorian").s("square").lpf(500).release(.2).gain(.4)
