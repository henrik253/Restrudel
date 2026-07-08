setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").hpf(6000).gain(.15).pan(.4)

$: note("c1 f1 g1 c1 f1 g1 c1 f1").s("sawtooth")
  .lpf(600).release(.2).gain(.5)

$: note("c4 eb4 g4 c5").s("psaltery_pluck").attack(.05)
  .release(.3).room(.4).gain(.4)
