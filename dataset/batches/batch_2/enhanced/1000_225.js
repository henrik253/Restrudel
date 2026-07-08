setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.75)

$: n("~ 9 10!2 ~ 7 10!2 7!2 14!2").scale("c:major").gain(.3).speed(1.09).s("sawtooth")

$: s("ocarina_vib").n("0 2 4").gain(.3)

$: note("c1 f1 g1 c1").struct("<~@2 [x x] [x ~]>").gain(.4)
