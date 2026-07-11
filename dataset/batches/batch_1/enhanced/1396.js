setcpm(134/4)

$: s("bd:2*4").gain(.85)

$: note("c2 c2 [~ c2] f1 c2 c2 [~ g1] c2").s("pulse").lpf(1000).resonance(3).release(.1).gain(.45)

$: s("[~ hh]*4").gain(.2)

$: n("<0 ~ [~ 3] 2>").scale("c:minor").s("sawtooth").lpf(1500).delay(.4).release(.15).gain(.25)
