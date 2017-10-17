class KnownCode implements GenericCodeInterface
{
    public Author: string;
    public Name: string;
    public Source: string;
    public code: CodeEnvironement;
    public Parameters: CodeVariableContainer = {};
    public Description: string;
    public Includes: IncludedDefinition[] = [];
    public Enabled: boolean;
    public CodeBrowsing: boolean;
    public AllowEditing: boolean;
    public Price: number;
    public Version: string;

    public Store(): GenericCodeInterface
    {
        return {
            Author: this.Author,
            Name: this.Name,
            Source: this.Source,
            Parameters: this.Parameters,
            Description: this.Description,
            Includes: this.Includes,
            Enabled: this.Enabled,
            CodeBrowsing: this.CodeBrowsing,
            AllowEditing: this.AllowEditing,
            Price: this.Price,
            Version: this.Version
        };
    }
}