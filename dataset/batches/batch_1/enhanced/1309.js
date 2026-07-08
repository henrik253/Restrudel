setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ lt ~ ht").gain(.4).pan(.55)

$: note("a4 c5 e5 g5").s("triangle")
  .lpf(3000).release(.2).room(.4).delay(.4).gain(.35)

$: n("-3 -1 1 -4 -1 -1 -5 -3 -3 -3 -1 -1 -4 -2 -2 -5 -3 -1").scale("a:minor").s("sawtooth")
  .clip(1).release(.1).lpf(1500).gain(.4)
