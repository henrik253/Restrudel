setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*4").gain(.18).pan(.4)

$: note("<c3 g2 eb3 f2>").s("triangle").lpf(400).release(.3).room(.4).gain(.45)

$: n("0 3 5 7 5 3").scale("c:minor").s("sawtooth").lpf(2200).resonance(6).release(.2).delay(.3).gain(.35)
