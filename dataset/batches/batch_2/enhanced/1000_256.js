setcpm(100/4)
$: s("bell ~ anvil ~").delay(.4).gain(.4)
$: s("bd ~ sd ~").bank("RolandTR808").gain(.7)
$: n("-3 -3 -1 -1 -4 -2 0 -2 0 -5 -3 -1").scale("C:minor").s("triangle").gain(.3).release(.15)
