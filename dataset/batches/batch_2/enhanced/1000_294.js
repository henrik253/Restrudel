setcpm(100/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: note("a3 d4 d#4 d4").sound("triangle").gain(.4)
$: note(0).clip(1).release(.0641).attack(1.5).s("sawtooth").gain(.3)
