setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ ht ~ ht").gain(.3).release(.3)

$: note("c3 g#2 c3 f3").s("triangle").lpf(700).release(.3).room(.5).gain(.45)

$: s("pad ~ ~ ~").lpf(2000).room(.4).release(.5).attack(.001).gain(.4)

$: n("0 3 5 7 5 3").scale("c:minor").s("sawtooth").lpf(2200).resonance(6).release(.2).delay(.3).gain(.35)
