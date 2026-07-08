setcpm(128/4)

$: s("bd*2 sd").gain(.85)

$: s("hh*8 shaker*8").gain(.16)

$: n("3 2 5 3 5 8 7 9!2 7 8 5 1 2 4 ~ 5!2 4").scale("c:minor").s("sawtooth").lpf(3000).release(.15).room(.3).gain(.4)

$: n("0 ~ -5 ~").scale("c:minor").s("square").lpf(500).release(.2).gain(.4)
