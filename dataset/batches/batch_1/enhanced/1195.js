setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ bongo ~ bongo*2").gain(.35).pan(.5)

$: note("a2*8").s("gm_overdriven_guitar:3").lpf(1500).release(.15).gain(.45)

$: n("0 3 5 7 5 3 0 -3").scale("a:minor").s("piano").release(.5).delay(.5).delayfeedback(.4).delaytime(.33).room(.3).gain(.35)
