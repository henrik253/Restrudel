setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ ~ ~ cymbal").room(.5).gain(.5)

$: s("hh*8").gain("[.2 .14]*4").pan(.55)

$: note("d#5@2 d5@2 c#5@2 d5").s("sawtooth")
  .lpf(2200).resonance(6).release(.2).delay(.4).room(.4).gain(.4)

$: note("<d2 g1 a1 d1>").s("square").lpf(600).release(.25).gain(.5)
