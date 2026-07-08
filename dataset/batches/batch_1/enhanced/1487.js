setcpm(140/4)

$: note("a2*8").s("square").lpf("<600 900 1300 900>").resonance(4).release(.09).gain(.45)

$: s("hh*8").gain("[.2 .12]*4")

$: s("[~ oh:2]*4").gain(.2)

$: s("bd ~ bd ~ bd ~ bd sd").gain(.85)

$: note("<a3 [~ g3] a3 c4>").s("gm_overdriven_guitar:6").lpf(1500).release(.2).gain(.3).room(.4)
