Public Class bgfToJavascriptLib

    Private Sub FolderPathBtn_Click(sender As Object, e As EventArgs) Handles FolderPathBtn.Click
        FolderBrowserDialog1.Description = "Please Select a Source Folder"

        FolderBrowserDialog1.ShowDialog()
        FolderPathTxt.Text = FolderBrowserDialog1.SelectedPath
    End Sub

    Private Sub Button1_Click(sender As Object, e As EventArgs) Handles Button1.Click
        FolderBrowserDialog1.Description = "Please Select a Destination Folder"

        FolderBrowserDialog1.ShowDialog()
        TextBox1.Text = FolderBrowserDialog1.SelectedPath
    End Sub

    Private Sub Button2_Click(sender As Object, e As EventArgs) Handles Button2.Click

        Dim JsOutput As String
        Dim max As Int32

        JsOutput = "var BgfTextures = new Array(100000);" + Environment.NewLine + Environment.NewLine
        ' make a reference to a directory
        Dim di As New IO.DirectoryInfo(FolderPathTxt.Text)
        Dim diar1 As IO.FileInfo() = di.GetFiles()
        Dim dra As IO.FileInfo

        'list the names of all files in the specified directory
        For Each dra In diar1
            If dra.Extension = ".bgf" Then
                'grd00020.bgf
                'dra.ToString().Substring(3, 5)
                'Sectors(i).CeilingHeight = BitConverter.ToInt16(bytes, offset + 12)
                'Sectors(i).LightLevel = bytes.ElementAt(offset + 14).ToString()

                Dim bytes = My.Computer.FileSystem.ReadAllBytes(dra.FullName)

                JsOutput = JsOutput + "BgfTextures[" + Convert.ToInt32(dra.ToString().Substring(3, 5)).ToString() + "] = {magicnumber: " + BitConverter.ToInt32(bytes, 0).ToString() + ", name: 'test', numbitmaps: " + BitConverter.ToInt32(bytes, 40).ToString() + ", numbitmapgroups: " + BitConverter.ToInt32(bytes, 44).ToString() + ", shrinkfactor: " + BitConverter.ToInt32(bytes, 52).ToString() + ", width: " + BitConverter.ToInt32(bytes, 56).ToString() + ", height: " + BitConverter.ToInt32(bytes, 60).ToString() + ", transparent: 0};" + Environment.NewLine

                ListBox1.Items.Add(dra)
            End If

        Next
        TextBox2.Text = JsOutput
    End Sub
End Class
