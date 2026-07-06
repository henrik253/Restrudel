setcpm(112/4)

$: s("~ bd ~ bd").bank("RolandTR808").gain(.85)

$: s("~ sd ~ ~").bank("RolandTR808").gain(.55)

$: s("hh hh hh*2 hh").gain(.5).release(.1).pan(.4)

$: note("c d e c").scale("c:major").s("sawtooth")
  .lpf(2000).resonance(5).release(.15).delay(.3).gain(.4)

$: note("<c2 g1 a1 f1>").s("square").lpf(600).release(.25).gain(.5)
