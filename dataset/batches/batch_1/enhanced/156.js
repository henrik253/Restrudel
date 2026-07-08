setcpm(122/4)

$: s("kick ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").bank("RolandTR909").gain(.3)

$: s("lt mt ~ lt").hpf(400).lpf(2000).gain(.5).pan(.55)

$: note("a4 d#5@3 ~ a4").s("sawtooth")
  .room(.8).delay(.5).release(.3).lpf(2600).gain(.4)

$: note("<a2 a1 d2 e2>").s("square")
  .lpf(600).release(.25).gain(.5)
