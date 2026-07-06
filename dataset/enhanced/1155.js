setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ oh ~ oh").gain(.2).release(.2)

$: n("3 1 2 0 3 5 2 1").scale("d:minor").s("sawtooth").lpf(2200).resonance(6).release(.2).delay(.3).gain(.4)

$: n("<d2 a1 f1 c2>").scale("d:minor").s("square").lpf(650).release(.3).gain(.5)
