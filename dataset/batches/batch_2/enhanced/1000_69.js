setcpm(105/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("sleighbells cowbell").room(.3).gain(.2)

$: n("0 -3 0 0 -3 0").scale("c:ritusen").struct("x(5,8,-1)").s("square").release(.15).gain(.4)

$: note("c3 g2").s("psaltery_pluck").hpf(500).release(.2).gain(.5)
