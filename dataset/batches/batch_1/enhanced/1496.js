setcpm(136/4)

$: note("<[d2*8] [d2*4 c#2*2 d2*2]>").s("square").lpf(800).resonance(4).release(.09).gain(.45)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("hh*5 hh*2 ~ hh").gain(.2)

$: n("<7 ~ [9 7] 10>").scale("d:minor").s("bell").room("<0 .2>").delay(.5).lpf(3000).hpf(600).gain(.3)
