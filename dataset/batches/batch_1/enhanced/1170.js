setcpm(128/4)

$: s("bd ~ sd ~").bank("linn9000").gain(.85)

$: s("~ sleighbells ~ sleighbells").gain(.2).pan(.6)

$: n("0 1 3 1 5 4 3 2 0 0 -3 0 0 -3 0 0").scale("d:minor").s("pulse").lpf(2400).resonance(6).release(.15).delay(.3).gain(.4).fast(2)

$: n("<d1 a1 f1 c2>").scale("d:minor").s("sawtooth").lpf(600).release(.3).gain(.5)
