<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class bgfToJavascriptLib
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        Me.FolderPathTxt = New System.Windows.Forms.TextBox()
        Me.FolderPathBtn = New System.Windows.Forms.Button()
        Me.FolderBrowserDialog1 = New System.Windows.Forms.FolderBrowserDialog()
        Me.Button1 = New System.Windows.Forms.Button()
        Me.TextBox1 = New System.Windows.Forms.TextBox()
        Me.Button2 = New System.Windows.Forms.Button()
        Me.ListBox1 = New System.Windows.Forms.ListBox()
        Me.TextBox2 = New System.Windows.Forms.TextBox()
        Me.SuspendLayout()
        '
        'FolderPathTxt
        '
        Me.FolderPathTxt.Location = New System.Drawing.Point(55, 40)
        Me.FolderPathTxt.Name = "FolderPathTxt"
        Me.FolderPathTxt.Size = New System.Drawing.Size(260, 20)
        Me.FolderPathTxt.TabIndex = 0
        Me.FolderPathTxt.Text = "C:\Users\Matthew\Desktop\Meridian59-1.0.4.0\resources\bgftextures"
        '
        'FolderPathBtn
        '
        Me.FolderPathBtn.Location = New System.Drawing.Point(343, 40)
        Me.FolderPathBtn.Name = "FolderPathBtn"
        Me.FolderPathBtn.Size = New System.Drawing.Size(169, 20)
        Me.FolderPathBtn.TabIndex = 1
        Me.FolderPathBtn.Text = "Select Source Folder"
        Me.FolderPathBtn.UseVisualStyleBackColor = True
        '
        'Button1
        '
        Me.Button1.Location = New System.Drawing.Point(343, 87)
        Me.Button1.Name = "Button1"
        Me.Button1.Size = New System.Drawing.Size(169, 20)
        Me.Button1.TabIndex = 3
        Me.Button1.Text = "Select Output Folder"
        Me.Button1.UseVisualStyleBackColor = True
        '
        'TextBox1
        '
        Me.TextBox1.Location = New System.Drawing.Point(55, 87)
        Me.TextBox1.Name = "TextBox1"
        Me.TextBox1.Size = New System.Drawing.Size(260, 20)
        Me.TextBox1.TabIndex = 2
        Me.TextBox1.Text = "C:\Users\Matthew\Desktop"
        '
        'Button2
        '
        Me.Button2.Location = New System.Drawing.Point(343, 131)
        Me.Button2.Name = "Button2"
        Me.Button2.Size = New System.Drawing.Size(169, 23)
        Me.Button2.TabIndex = 4
        Me.Button2.Text = "Extract Data"
        Me.Button2.UseVisualStyleBackColor = True
        '
        'ListBox1
        '
        Me.ListBox1.FormattingEnabled = True
        Me.ListBox1.Location = New System.Drawing.Point(537, 40)
        Me.ListBox1.Name = "ListBox1"
        Me.ListBox1.Size = New System.Drawing.Size(405, 446)
        Me.ListBox1.TabIndex = 5
        '
        'TextBox2
        '
        Me.TextBox2.Location = New System.Drawing.Point(55, 222)
        Me.TextBox2.Name = "TextBox2"
        Me.TextBox2.Size = New System.Drawing.Size(260, 20)
        Me.TextBox2.TabIndex = 6
        '
        'bgfToJavascriptLib
        '
        Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
        Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
        Me.ClientSize = New System.Drawing.Size(954, 504)
        Me.Controls.Add(Me.TextBox2)
        Me.Controls.Add(Me.ListBox1)
        Me.Controls.Add(Me.Button2)
        Me.Controls.Add(Me.Button1)
        Me.Controls.Add(Me.TextBox1)
        Me.Controls.Add(Me.FolderPathBtn)
        Me.Controls.Add(Me.FolderPathTxt)
        Me.Name = "bgfToJavascriptLib"
        Me.Text = "Form1"
        Me.ResumeLayout(False)
        Me.PerformLayout()

    End Sub
    Friend WithEvents FolderPathTxt As System.Windows.Forms.TextBox
    Friend WithEvents FolderPathBtn As System.Windows.Forms.Button
    Friend WithEvents FolderBrowserDialog1 As System.Windows.Forms.FolderBrowserDialog
    Friend WithEvents Button1 As System.Windows.Forms.Button
    Friend WithEvents TextBox1 As System.Windows.Forms.TextBox
    Friend WithEvents Button2 As System.Windows.Forms.Button
    Friend WithEvents ListBox1 As System.Windows.Forms.ListBox
    Friend WithEvents TextBox2 As System.Windows.Forms.TextBox

End Class
