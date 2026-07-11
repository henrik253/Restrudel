setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("cymbal ~ ~ ~").hpf(7000).room(.45).gain(.2)

$: note("c4@2 c4 ~").s("supersaw").lpf(3500).delay(.4).release(.5).gain(".3 .45")

$: n("0 3 7 <5 8>").scale("c:minor").s("square").lpf(1200).release(.2).gain(.35)

$: note("c2 c2 g1 c2").s("square").lpf(500).release(.15).gain(.5)
