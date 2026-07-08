setcpm(90/4)

$: s("drums ~ sd ~").bank("RolandTR909").gain(.75)
$: s("hh*8").gain(.25).pan("0.2 -0.2")
$: n("0 ~ 3 ~").scale("c:minor").s("sine").lpf(4000).resonance(4).gain(.4).release(.1)
$: n("4 7 5 0").scale("c:minor").s("supersaw").lpf(2000).resonance(6).gain(.35).release(.15).room(.2)
