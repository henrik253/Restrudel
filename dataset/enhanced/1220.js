setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4 ~").lpf(1304).hpf(1177).gain(.2)

$: s("~ cowbell ~ ~").gain(.3)

$: n("0 3 5 3").scale("e:minor").s("sawtooth")
  .lpf(2000).resonance(5).release(.15).delay(.4).gain(.4)

$: n("<e2 e2 b1 c2>").scale("e:minor").s("square")
  .lpf(600).release(.2).gain(.5)
