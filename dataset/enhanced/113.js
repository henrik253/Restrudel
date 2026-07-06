setcpm(126/4)

$: s("~ cr sd ~").bank("RolandTR909").lpf(3722).gain(.6)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain("[.2 1@3]*2").hpf(4000).room(.5).delay(.4).delaytime(.08)

$: n("0 3 5 7 5 3").scale("c:minor").s("sawtooth")
  .lpf(2000).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<c2 g1 eb2 g1>").scale("c:minor").s("square").lpf(650).release(.25).gain(.5)
