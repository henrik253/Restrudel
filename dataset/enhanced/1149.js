setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: note("~ c4 c4 a4@3").s("sawtooth").lpf(605)
  .release(.19).delay(.3).gain(.4)

$: note("a3 a2 a3 a2").s("supersaw").hpf(200).lpf(2000)
  .release(.2).gain(.35)
